package br.com.conectatea.shared.api;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(MethodArgumentNotValidException.class) ApiError validation(MethodArgumentNotValidException e,HttpServletRequest r){var fields=new LinkedHashMap<String,String>();e.getBindingResult().getFieldErrors().forEach(x->fields.putIfAbsent(x.getField(),x.getDefaultMessage()));return error(400,"Bad Request","VALIDATION_ERROR","Dados inválidos",r.getRequestURI(),fields);}
 @ExceptionHandler(BadCredentialsException.class) ApiError credentials(Exception e,HttpServletRequest r){return error(401,"Unauthorized","INVALID_CREDENTIALS","Credenciais inválidas",r.getRequestURI(),null);}
 @ExceptionHandler(AccessDeniedException.class) ApiError denied(Exception e,HttpServletRequest r){return error(403,"Forbidden","ACCESS_DENIED","Acesso negado",r.getRequestURI(),null);}
 @ExceptionHandler(DataIntegrityViolationException.class) ApiError conflict(Exception e,HttpServletRequest r){return error(409,"Conflict","DATA_CONFLICT","Registro já existente ou referenciado",r.getRequestURI(),null);}
 @ExceptionHandler(ResponseStatusException.class) ApiError status(ResponseStatusException e,HttpServletRequest r){return error(e.getStatusCode().value(),e.getStatusCode().toString(),"REQUEST_ERROR",e.getReason(),r.getRequestURI(),null);}
 private ApiError error(int status,String err,String code,String message,String path,Map<String,String> fields){return new ApiError(Instant.now(),status,err,code,message,path,fields);}
 public record ApiError(Instant timestamp,int status,String error,String code,String message,String path,Map<String,String> fields){}
}

