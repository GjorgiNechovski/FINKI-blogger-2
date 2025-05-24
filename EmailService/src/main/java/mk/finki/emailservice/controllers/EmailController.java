package mk.finki.emailservice.controllers;

import mk.finki.emailservice.services.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class EmailController {
    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @RabbitListener(queues = "like_events")
    public void handleLikeEvent(String message) {
        String[] parts = message.split("\\|");
        if (parts.length == 3) {
            String email = parts[0];
            String header = parts[1];
            String messageContent = parts[2];

            this.emailService.sendEmail(email, header, messageContent);
        } else {
            System.err.println("Received malformed message: " + message);
        }
    }
}