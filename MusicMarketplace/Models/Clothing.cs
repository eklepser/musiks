using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("Clothing")]
    public class Clothing
    {
        public int clothing_id { get; set; }
        public int merch_id { get; set; }
        public string size { get; set; }
        public string gender { get; set; }

        public virtual Merch Merch { get; set; }
    }
}