FROM maven:latest

WORKDIR /app

COPY pom.xml .

RUN mvn clean install -DskipTests

COPY . .

EXPOSE 8080

CMD ["mvn", "spring-boot:run"]