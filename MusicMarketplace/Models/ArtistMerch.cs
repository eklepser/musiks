using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("ArtistMerch")]
    public class ArtistMerch
    {
        public int artist_id { get; set; }
        public int merch_id { get; set; }
        public virtual Merch merch { get; set; }
    }
}