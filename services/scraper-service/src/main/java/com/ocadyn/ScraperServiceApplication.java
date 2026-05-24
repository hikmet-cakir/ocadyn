package com.ocadyn;

import com.ocadyn.config.CommonLibAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@Import(CommonLibAutoConfiguration.class)
public class ScraperServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScraperServiceApplication.class, args);
    }
}
