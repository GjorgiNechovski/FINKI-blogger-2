package mk.finki.emailservice.services;

import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender emailSender;


    public EmailService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @WithSpan("email.send")
    public void sendEmail(@SpanAttribute("email.to") String to,
                          @SpanAttribute("email.subject") String subject,
                          String body) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            emailSender.send(message);
        } catch (Exception e){
            System.out.println(e.getMessage());
        }
    }
}