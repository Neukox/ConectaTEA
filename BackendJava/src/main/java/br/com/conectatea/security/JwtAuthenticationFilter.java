package br.com.conectatea.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    public JwtAuthenticationFilter(JwtService jwtService){this.jwtService=jwtService;}
    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
        String token=null;
        if(request.getCookies()!=null) token=Arrays.stream(request.getCookies()).filter(c->"jwt".equals(c.getName())).map(Cookie::getValue).findFirst().orElse(null);
        if(token!=null){try{var user=jwtService.parse(token);var auth=new UsernamePasswordAuthenticationToken(user,null,List.of(new SimpleGrantedAuthority("ROLE_"+user.tipo().name())));SecurityContextHolder.getContext().setAuthentication(auth);}catch(Exception ignored){SecurityContextHolder.clearContext();}}
        chain.doFilter(request,response);
    }
}

