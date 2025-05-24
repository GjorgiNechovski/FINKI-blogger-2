package mk.finki.emailservice.services;

import jakarta.mail.internet.MimeMessage;
import lombok.SneakyThrows;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender emailSender;


    public EmailService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @SneakyThrows
    public void sendEmail(String to, String subject, String body) {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        try {
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            emailSender.send(message);
        } catch (Exception e){
            System.out.println(e.getMessage());
        }
    }
}