package com.ocadyn.user;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserContactRepository extends MongoRepository<UserContact, String> {}
