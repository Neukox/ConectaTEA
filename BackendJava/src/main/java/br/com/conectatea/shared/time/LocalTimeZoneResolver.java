package br.com.conectatea.shared.time;

import java.time.DateTimeException;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Resolve limites civis sem inferir fuso por UF, que é ambígua no Brasil. */
@Component
public class LocalTimeZoneResolver {
    public static final ZoneId FALLBACK = ZoneId.of("America/Bahia");
    private final ZoneId configuredZone;

    public LocalTimeZoneResolver(@Value("${app.time-zone:America/Bahia}") String configuredTimezone) {
        this.configuredZone = parse(configuredTimezone, "app.time-zone");
    }

    LocalTimeZoneResolver() {
        this.configuredZone = FALLBACK;
    }

    public ZoneId resolve(String timezone) {
        if (timezone == null || timezone.isBlank()) {
            return configuredZone;
        }
        return parse(timezone, "timezone");
    }

    public String configuredZoneId() {
        return configuredZone.getId();
    }

    private static ZoneId parse(String timezone, String source) {
        try {
            return ZoneId.of(timezone);
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException(source + " deve ser um identificador IANA válido", exception);
        }
    }
}
