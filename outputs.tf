# GCP outputs for GitHub Actions
output "app_url" {
  description = "The URL of the deployed application"
  value       = "http://${google_compute_instance.app_server.network_interface.0.access_config.0.nat_ip}"
}

output "database_connection" {
  description = "The connection string for the database"
  value       = "mysql://nest:${random_password.db_password.result}@${google_compute_instance.app_server.network_interface.0.access_config.0.nat_ip}:3306/nest_crud"
  sensitive   = true
}

output "redis_host" {
  description = "The Redis instance host"
  value       = google_compute_instance.app_server.network_interface.0.access_config.0.nat_ip
}

output "redis_password" {
  description = "The Redis password"
  value       = random_password.redis_password.result
  sensitive   = true
}

output "rabbitmq_url" {
  description = "The RabbitMQ connection URL"
  value       = "amqp://admin:${random_password.rabbitmq_password.result}@${google_compute_instance.app_server.network_interface.0.access_config.0.nat_ip}:5672"
  sensitive   = true
}

output "rabbitmq_management_url" {
  description = "The RabbitMQ management interface URL"
  value       = "http://${google_compute_instance.app_server.network_interface.0.access_config.0.nat_ip}:15672"
}

output "ssh_command" {
  description = "SSH command to connect to the VM"
  value       = "ssh -i [YOUR_PRIVATE_KEY] [USERNAME]@${google_compute_instance.app_server.network_interface.0.access_config.0.nat_ip}"
}
