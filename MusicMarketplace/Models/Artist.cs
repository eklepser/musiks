using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("Artist")]
    public class Artist
    {
        public int artist_id { get; set; }
        public string name { get; set; }
        public string? country { get; set; }
        public int? debut_year { get; set; }
        public string? language { get; set; }

        public virtual ICollection<ArtistConcert> ArtistConcerts { get; set; } = new List<ArtistConcert>();
        public virtual ICollection<ArtistMerch> ArtistMerches { get; set; } = new List<ArtistMerch>();
    }
}