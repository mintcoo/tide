package com.tide.music.jpa.playlist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPlaylistRepository extends JpaRepository<UserPlaylist, Long> {

    List<UserPlaylist> findAllByUserId(Long userId);
}