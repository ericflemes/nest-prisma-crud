# Configure the Google Cloud provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Configure the random provider
provider "random" {}

# Generate random password for database
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "_%@"
}

# Cloud Run service
resource "google_cloud_run_service" "app" {
  name     = "nest-prisma-crud-${var.environment}"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/nest-prisma-crud-${var.environment}:latest"
        
        env {
          name  = "DATABASE_URL"
          value = "mysql://root:${random_password.db_password.result}@${google_sql_database_instance.instance.private_ip_address}:3306/nest_prisma_crud"
        }
        
        env {
          name  = "REDIS_HOST"
          value = google_redis_instance.cache.host
        }
        
        env {
          name  = "REDIS_PORT"
          value = "6379"
        }
        
        env {
          name  = "NODE_ENV"
          value = var.environment
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  
  autogenerate_revision_name = true
}

# Cloud SQL instance
resource "google_sql_database_instance" "instance" {
  name             = "nest-prisma-crud-db-${var.environment}"
  database_version = "MYSQL_8_0"
  region           = var.region

  settings {
    tier = var.environment == "production" ? "db-n1-standard-1" : "db-f1-micro"
    
    backup_configuration {
      enabled            = var.environment == "production" ? true : false
      binary_log_enabled = var.environment == "production" ? true : false
      start_time         = "02:00"
    }
    
    maintenance_window {
      day          = 7  # Sunday
      hour         = 3
      update_track = "stable"
    }
  }
  
  deletion_protection = var.environment == "production" ? true : false
}

# Create a database
resource "google_sql_database" "database" {
  name     = "nest_prisma_crud"
  instance = google_sql_database_instance.instance.name
}

# Create a user
resource "google_sql_user" "user" {
  name     = "root"
  instance = google_sql_database_instance.instance.name
  password = random_password.db_password.result
}

# Redis instance
resource "google_redis_instance" "cache" {
  name           = "nest-prisma-crud-cache-${var.environment}"
  memory_size_gb = var.environment == "production" ? 2 : 1
  region         = var.region

  redis_version = "REDIS_6_X"
  tier          = "BASIC"
  
  auth_enabled = true
  
  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 2
        minutes = 0
      }
    }
  }
}

# Allow unauthenticated access to Cloud Run service
resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.app.name
  location = google_cloud_run_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
