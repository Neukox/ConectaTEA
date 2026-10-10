package br.com.conectatea.auditoria.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.conectatea.auditoria.domain.AuditLog;
import br.com.conectatea.auditoria.infrastructure.AuditLogRepository;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

class AuditLogServiceTest {
    private final AuditLogRepository repository = mock(AuditLogRepository.class);
    private final AuditLogService service = new AuditLogService(repository);

    @AfterEach
    void clearRequestContext() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void recordsIpAndUserAgentInsideWebRequest() {
        var request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "203.0.113.7, 10.0.0.1");
        request.addHeader("User-Agent", "ConectaTEA-Test");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        service.record(1L,"TEST","RESOURCE",2L,null,null,"SUCESSO",null);

        var captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue()).extracting("ip","userAgent")
                .containsExactly("203.0.113.7","ConectaTEA-Test");
    }

    @Test
    void persistsWithNullRequestDataOutsideWebRequest() {
        assertThatCode(() -> service.record(1L,"TEST","RESOURCE",2L,null,null,"SUCESSO",null))
                .doesNotThrowAnyException();

        var captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue()).extracting("ip","userAgent").containsExactly(null,null);
    }

    @Test
    void persistsWithNullRequestDataOnAsyncThread() {
        var request = new MockHttpServletRequest();
        request.addHeader("User-Agent", "must-not-cross-thread");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        assertThatCode(() -> CompletableFuture.runAsync(() ->
                service.record(1L,"ASYNC_TEST","RESOURCE",2L,null,null,"SUCESSO",null)).join())
                .doesNotThrowAnyException();

        var captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(repository,timeout(1000)).save(captor.capture());
        assertThat(captor.getValue()).extracting("ip","userAgent").containsExactly(null,null);
    }

    @Test
    void mandatorySuccessFailureIsNeverSilentlySuppressed() {
        when(repository.save(any())).thenThrow(new IllegalStateException("database unavailable"));
        assertThatThrownBy(() -> service.record(1L,"DOMAIN_CHANGED","RESOURCE",2L,null,null,"SUCESSO",null))
                .isInstanceOf(IllegalStateException.class).hasMessage("database unavailable");
    }

    @Test
    void attemptCannotMasqueradeAsCompletedOperation() {
        assertThatThrownBy(() -> service.recordAttempt(1L,"LOGIN","USER",1L,null,null,"SUCESSO",null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
