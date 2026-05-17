using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("ArtistConcert")]
    public class ArtistConcert
    {
        public int artist_id { get; set; }
        public int concert_id { get; set; }
    }
}