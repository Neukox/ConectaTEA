package br.com.conectatea.shared.api;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import br.com.conectatea.passwordreset.application.InvalidPasswordResetTokenException;
import br.com.conectatea.shared.domain.BusinessRuleException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(BusinessRuleException.class)
    ResponseEntity<ApiError> businessRule(
            BusinessRuleException exception,
            HttpServletRequest request) {
        return response(HttpStatus.CONFLICT, exception.getCode(), exception.getMessage(), request, null);
    }

    @ExceptionHandler(InvalidPasswordResetTokenException.class)
    ResponseEntity<ApiError> invalidPasswordResetToken(
            InvalidPasswordResetTokenException exception,
            HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "INVALID_PASSWORD_RESET_TOKEN",
                "Token de redefinição inválido ou expirado.", request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        var fields = new LinkedHashMap<String, String>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                fields.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return response(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Dados inválidos",
                request,
                fields);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiError> invalidArgument(
            IllegalArgumentException exception,
            HttpServletRequest request) {
        return response(
                HttpStatus.BAD_REQUEST,
                "INVALID_ARGUMENT",
                exception.getMessage(),
                request,
                null);
    }

    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<ApiError> notFound(
            NoSuchElementException exception,
            HttpServletRequest request) {
        return response(
                HttpStatus.NOT_FOUND,
                "NOT_FOUND",
                "Recurso não encontrado",
                request,
                null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<ApiError> credentials(
            BadCredentialsException exception,
            HttpServletRequest request) {
        return response(
                HttpStatus.UNAUTHORIZED,
                "INVALID_CREDENTIALS",
                "Credenciais inválidas",
                request,
                null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> denied(
            AccessDeniedException exception,
            HttpServletRequest request) {
        return response(
                HttpStatus.FORBIDDEN,
                "ACCESS_DENIED",
                "Acesso negado",
                request,
                null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> conflict(
            DataIntegrityViolationException exception,
            HttpServletRequest request) {
        return response(
                HttpStatus.CONFLICT,
                "DATA_CONFLICT",
                "Registro já existente ou referenciado",
                request,
                null);
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    ResponseEntity<ApiError> optimisticLock(
            ObjectOptimisticLockingFailureException exception,
            HttpServletRequest request) {
        return response(
                HttpStatus.CONFLICT,
                "CONCURRENT_UPDATE",
                "O recurso foi alterado por outra operação",
                request,
                null);
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> responseStatus(
            ResponseStatusException exception,
            HttpServletRequest request) {
        var status = HttpStatus.valueOf(exception.getStatusCode().value());
        return response(
                status,
                "REQUEST_ERROR",
                exception.getReason(),
                request,
                null);
    }

    private ResponseEntity<ApiError> response(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request,
            Map<String, String> fields) {
        var body = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                code,
                message,
                request.getRequestURI(),
                fields);
        return ResponseEntity.status(status).body(body);
    }

    public record ApiError(
            Instant timestamp,
            int status,
            String error,
            String code,
            String message,
            String path,
            Map<String, String> fields) {
    }
}

