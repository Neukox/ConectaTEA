package br.com.conectatea;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class ConectaTeaApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConectaTeaApplication.class, args);
    }
}

