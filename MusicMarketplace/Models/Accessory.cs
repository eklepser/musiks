using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("Accessory")]
    public class Accessory
    {
        public int accessory_id { get; set; }
        public int merch_id { get; set; }
        public string accessory_type { get; set; }
        public decimal? weight { get; set; }

        public virtual Merch Merch { get; set; }
    }
}