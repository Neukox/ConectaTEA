package br.com.conectatea.crianca.infrastructure;
import br.com.conectatea.crianca.domain.Crianca;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface CriancaRepository extends JpaRepository<Crianca,Long>{
 @Query("select c from Crianca c where c.arquivada=false and c.id in (select v.criancaId from VinculoProfissionalCrianca v where v.profissionalId=:id and v.status=br.com.conectatea.vinculo.domain.StatusVinculo.VINCULADO)") List<Crianca> findLinkedToProfessional(@Param("id")Long id);
 @Query("select c from Crianca c where c.arquivada=false and c.id in (select v.criancaId from VinculoResponsavelCrianca v where v.responsavelId=:id and v.status=br.com.conectatea.vinculo.domain.StatusVinculo.VINCULADO)") List<Crianca> findLinkedToGuardian(@Param("id")Long id);
}

