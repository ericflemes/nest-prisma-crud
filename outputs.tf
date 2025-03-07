output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.allow_web.id
}

# GCP outputs for GitHub Actions
output "cloud_run_url" {
  description = "The URL of the deployed Cloud Run service"
  value       = google_cloud_run_service.app.status[0].url
}

output "database_connection" {
  description = "The connection string for the database"
  value       = "mysql://root:${random_password.db_password.result}@${google_sql_database_instance.instance.private_ip_address}:3306/nest_prisma_crud"
  sensitive   = true
}

output "redis_host" {
  description = "The Redis instance host"
  value       = google_redis_instance.cache.host
}
