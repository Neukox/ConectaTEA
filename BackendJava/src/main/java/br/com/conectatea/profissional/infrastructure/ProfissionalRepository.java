package br.com.conectatea.profissional.infrastructure;
import br.com.conectatea.profissional.domain.Profissional;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProfissionalRepository extends JpaRepository<Profissional,Long>{Optional<Profissional> findByUsuarioId(Long usuarioId);}

