using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("MerchGenre")]
    public class MerchGenre
    {
        public int merch_id { get; set; }
        public int genre_id { get; set; }
    }
}