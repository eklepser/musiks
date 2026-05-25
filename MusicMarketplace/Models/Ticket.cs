using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("Ticket")]
    public class Ticket
    {
        public int ticket_id { get; set; }
        public int concert_id { get; set; }
        public int product_id { get; set; }
        public string price_category { get; set; }

        public virtual Concert concert { get; set; }
        public virtual Product product { get; set; }
    }
}