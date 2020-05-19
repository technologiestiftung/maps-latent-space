provider "aws" {
  region  = var.region
  profile = var.profile
  version = "2.62.0"
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd//ubuntu-bionic-18.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

variable "profile" {
  default = "tsberlin"
}

variable "region" {
  default = "eu-central-1"
}

output "amis" {
  value = data.aws_ami.ubuntu
}

