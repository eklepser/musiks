using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("Concert")]
    public class Concert
    {
        public int concert_id { get; set; }
        public string title { get; set; }
        public string venue { get; set; }
        public DateTime datetime { get; set; }

        public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
        public virtual ICollection<ArtistConcert> ArtistConcerts { get; set; } = new List<ArtistConcert>();
    }
}