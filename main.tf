# Configure the Google Cloud provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Cloud Run service
resource "google_cloud_run_service" "app" {
  name     = "nest-prisma-crud"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/nest-prisma-crud"
        
        env {
          name  = "DATABASE_URL"
          value = google_sql_database_instance.instance.connection_name
        }
        
        env {
          name  = "REDIS_HOST"
          value = google_redis_instance.cache.host
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Cloud SQL instance
resource "google_sql_database_instance" "instance" {
  name             = "nest-prisma-crud-db"
  database_version = "MYSQL_8_0"
  region           = var.region

  settings {
    tier = "db-f1-micro"
  }
}

# Redis instance
resource "google_redis_instance" "cache" {
  name           = "nest-prisma-crud-cache"
  memory_size_gb = 1
  region         = var.region

  redis_version = "REDIS_6_X"
  tier          = "BASIC"
}

# Allow unauthenticated access to Cloud Run service
resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.app.name
  location = google_cloud_run_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
