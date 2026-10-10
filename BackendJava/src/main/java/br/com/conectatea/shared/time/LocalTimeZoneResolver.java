package br.com.conectatea.shared.time;

import java.time.DateTimeException;
import java.time.ZoneId;
import org.springframework.stereotype.Component;

/** Resolve limites civis sem inferir fuso por UF, que é ambígua no Brasil. */
@Component
public class LocalTimeZoneResolver {
    public static final ZoneId FALLBACK = ZoneId.of("America/Bahia");

    public ZoneId resolve(String timezone) {
        if (timezone == null || timezone.isBlank()) {
            return FALLBACK;
        }
        try {
            return ZoneId.of(timezone);
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("timezone deve ser um identificador IANA válido");
        }
    }
}
