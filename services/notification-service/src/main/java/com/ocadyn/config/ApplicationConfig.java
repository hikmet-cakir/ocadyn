package com.ocadyn.config;

import com.ocadyn.data.MarketplaceReadConverter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.List;

@Configuration
@EnableMongoAuditing
@EnableConfigurationProperties({MailProperties.class, AppProperties.class})
public class ApplicationConfig {

    @Bean
    MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(new MarketplaceReadConverter()));
    }
}
