package dev.closet.closets;


import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
public class ClosetService {
    @Autowired
    private ClosetRepository closetRepository;

    public List<Closet> allClosets(){
        return closetRepository.findAll();
    }

    public Optional<Closet> closetById(ObjectId id){
        return closetRepository.findById(id);
    }
}
