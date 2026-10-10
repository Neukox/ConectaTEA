package br.com.conectatea.profissional.application;

import java.io.IOException;

public interface ProfileImageStorage {
    void store(String key, byte[] content) throws IOException;
    byte[] load(String key) throws IOException;
    void delete(String key) throws IOException;
}
