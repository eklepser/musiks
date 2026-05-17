using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("ProductGenre")]
    public class ProductGenre
    {
        public int product_id { get; set; }
        public int genre_id { get; set; }
    }
}