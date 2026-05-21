using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("ArtistMerch")]
    public class ArtistMerch
    {
        public int artist_id { get; set; }
        public int merch_id { get; set; }

        [ForeignKey("artist_id")]
        public virtual Artist Artist { get; set; } = null!;

        [ForeignKey("merch_id")]
        public virtual Merch Merch { get; set; } = null!;
    }
}