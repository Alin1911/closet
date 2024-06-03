package dev.closet.closets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClosetService {
    @Autowired
    private ClosetRepository closetRepository;

    public List<Closet> allClosets(){
        return closetRepository.findAll();
    }
}
