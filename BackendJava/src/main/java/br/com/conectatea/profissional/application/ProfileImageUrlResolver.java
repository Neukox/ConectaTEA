package br.com.conectatea.profissional.application;

/** Converte a referência persistida da foto em uma URL própria para respostas da API. */
public interface ProfileImageUrlResolver {
    String resolve(String reference);
}
