# FINKI-Blogger

This is an implementation of a SOA application, that has primary functionality of a blogging website like JWT authentication, listing blogs, creating blogs and liking the blogs, with a simple mail service for like notifications.

It has the following features:

- Full stack application (Angular, Spring, fastAPI and postgres)
- Multi Service application (frontend, 5 backend applications and 2 databases)
- Kong api gateway and loadbalancer
- Rabitmq message bus
- ZooKeeper Service Registry
- Multiple container replicas set up for each backend application (is handled by docker compose)

To run the application all you need is to run "docker-compose up"
The application should be running on localhost:4200
