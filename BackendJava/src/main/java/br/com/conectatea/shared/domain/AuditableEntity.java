package br.com.conectatea.shared.domain;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;

@MappedSuperclass
public abstract class AuditableEntity {
    @Column(name="created_at", nullable=false, updatable=false) protected Instant createdAt;
    @Column(name="updated_at", nullable=false) protected Instant updatedAt;
    @PrePersist void prePersist(){ var now=Instant.now(); createdAt=now; updatedAt=now; }
    @PreUpdate void preUpdate(){ updatedAt=Instant.now(); }
    public Instant getCreatedAt(){ return createdAt; }
    public Instant getUpdatedAt(){ return updatedAt; }
}

