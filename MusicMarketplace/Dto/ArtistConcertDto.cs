namespace MusicMarketplace.DTOs;

public class ArtistConcertDto
{
    public int artist_id { get; set; }
    public int concert_id { get; set; }
    public string? artist_name { get; set; }
    public string? concert_title { get; set; }
}