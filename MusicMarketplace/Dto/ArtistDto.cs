namespace MusicMarketplace.Models
{
    public class ArtistDto
    {
        public int artist_id { get; set; }  
        public string name { get; set; }
        public string? country { get; set; }
        public int? debut_year { get; set; }
        public string? language { get; set; }
    }
}