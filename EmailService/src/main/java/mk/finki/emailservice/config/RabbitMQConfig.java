package mk.finki.emailservice.config;

import mk.finki.emailservice.controllers.EmailController;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.amqp.rabbit.listener.adapter.MessageListenerAdapter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.support.converter.SimpleMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    static final String queueName = "like_events";

    @Bean
    Queue queue() {
        return new Queue(queueName, true);
    }

    @Bean
    MessageConverter messageConverter() {
        return new SimpleMessageConverter();
    }

    @Bean
    SimpleMessageListenerContainer container(ConnectionFactory connectionFactory,
                                             MessageListenerAdapter listenerAdapter) {
        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.setQueueNames(queueName);
        container.setMessageListener(listenerAdapter);
        return container;
    }

    @Bean
    MessageListenerAdapter listenerAdapter(EmailController receiver, MessageConverter messageConverter) {
        MessageListenerAdapter adapter = new MessageListenerAdapter(receiver, "handleLikeEvent");
        adapter.setMessageConverter(messageConverter);
        return adapter;
    }
}