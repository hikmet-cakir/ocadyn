package com.ocadyn;

import com.ocadyn.config.CommonLibAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import(CommonLibAutoConfiguration.class)
public class TrackerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrackerServiceApplication.class, args);
    }
}
