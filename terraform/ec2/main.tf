# Create a new instance of the latest Ubuntu 14.04 on an
# t2.micro node with an AWS Tag naming it "HelloWorld"
provider "aws" {
  region  = var.region
  profile = var.profile
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "worker" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.medium"
  vpc_security_group_ids = [var.security_group, aws_security_group.public-group.id]
  subnet_id              = var.subnet_id
  key_name               = var.key_name
  tags = {
    description    = "ec2 server running ml docker project"
    project = "maps-latent-space citylab birds on mars"
    type    = "tf-ec2"
  }

 provisioner "file" {
    source      = "provisioning/install.sh"
    destination = "/tmp/install.sh"
  }


  provisioner "remote-exec" {
    # might be needed to have the connection defined here
    # might be needed to have the connection defined here
    connection {
      type        = "ssh"
      host        = aws_instance.worker.public_dns
      private_key = file(var.key_file_path)
      port        = 22
      user        = "ubuntu"
    }
 inline = [
      "chmod +x /tmp/install.sh",
      "/tmp/install.sh",
    ]
  }
}

