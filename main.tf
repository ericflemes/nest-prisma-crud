# Configure the Google Cloud provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Configure the random provider
provider "random" {}

# Generate random passwords
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "_%@"
}

resource "random_password" "rabbitmq_password" {
  length           = 16
  special          = true
  override_special = "_%@"
}

resource "random_password" "redis_password" {
  length           = 16
  special          = true
  override_special = "_%@"
}

# Single VM to host all services
resource "google_compute_instance" "app_server" {
  name         = "nest-prisma-crud-${var.environment}"
  machine_type = var.environment == "production" ? "e2-standard-2" : "e2-medium"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
      size  = var.environment == "production" ? 50 : 30
    }
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral public IP
    }
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    set -e

    # Update system and install common dependencies
    apt-get update
    apt-get install -y curl gnupg apt-transport-https ca-certificates lsb-release git

    # Install Docker
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker

    # Create app directory and clone repository
    mkdir -p /app
    cd /app
    
    # Clone the repository
    git clone https://github.com/ericflemes/nest-prisma-crud.git
    cd nest-prisma-crud
    
    # Create .env file with secure credentials
    cat > .env <<'ENV_FILE'
    DATABASE_URL=mysql://nest:${random_password.db_password.result}@db:3306/nest_crud
    RABBITMQ_URL=amqp://admin:${random_password.rabbitmq_password.result}@rabbitmq:5672
    REDIS_URL=redis://redis:6379
    NODE_ENV=${var.environment}
    
    # Database credentials
    MYSQL_USER=nest
    MYSQL_PASSWORD=${random_password.db_password.result}
    MYSQL_ROOT_PASSWORD=${random_password.db_password.result}
    MYSQL_DATABASE=nest_crud
    
    # RabbitMQ credentials
    RABBITMQ_DEFAULT_USER=admin
    RABBITMQ_DEFAULT_PASS=${random_password.rabbitmq_password.result}
    ENV_FILE
    
    # Update port in docker-compose.yml to expose on port 80
    sed -i 's/"3001:3001"/"80:3001"/g' docker-compose.yml

    # Create a script to update the application code and rebuild containers
    cat > /app/update.sh <<'UPDATE_SCRIPT'
    #!/bin/bash
    cd /app
    
    # Pull latest code from repository
    if [ -d "nest-prisma-crud" ]; then
      cd nest-prisma-crud
      git pull
      cd ..
    else
      git clone https://github.com/ericflemes/nest-prisma-crud.git
    fi
    
    # Copy docker-compose.yml to the app directory if it doesn't exist
    if [ ! -f "docker-compose.yml" ]; then
      cp nest-prisma-crud/docker-compose.yml .
    fi
    
    # Stop and rebuild containers
    docker compose down
    docker compose up -d --build
    UPDATE_SCRIPT

    chmod +x /app/update.sh

    # Setup cron job for database backup if production
    if [ "${var.environment}" == "production" ]; then
      cat > /app/backup.sh <<'BACKUP_SCRIPT'
      #!/bin/bash
      TIMESTAMP=$(date +%Y%m%d%H%M%S)
      BACKUP_DIR=/app/backups
      mkdir -p $BACKUP_DIR
      
      # Backup MySQL
      docker exec nest-crud-db mysqldump -u root -p${random_password.db_password.result} --all-databases > $BACKUP_DIR/mysql_$TIMESTAMP.sql
      
      # Compress backup
      gzip $BACKUP_DIR/mysql_$TIMESTAMP.sql
      
      # Remove backups older than 7 days
      find $BACKUP_DIR -name "mysql_*.sql.gz" -type f -mtime +7 -delete
      BACKUP_SCRIPT
      
      chmod +x /app/backup.sh
      
      # Add to crontab - run daily at 2 AM
      echo "0 2 * * * /app/backup.sh" | crontab -
    fi

    # Start the application
    cd /app/nest-prisma-crud
    docker compose up -d
  EOF

  tags = ["nest-prisma-crud", var.environment]

  service_account {
    scopes = ["cloud-platform"]
  }
}

# Firewall rules
resource "google_compute_firewall" "app_firewall" {
  name    = "allow-app-${var.environment}"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "3306", "6379", "5672", "15672"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["nest-prisma-crud", var.environment]
}

