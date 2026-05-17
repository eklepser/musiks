using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models;

public partial class Concert
{
    public int concert_id { get; set; }

    public string title { get; set; } = null!;

    public string venue { get; set; } = null!;

    public DateTime datetime { get; set; }

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

    [NotMapped]
    public virtual ICollection<Artist> artists { get; set; } = new List<Artist>();
}
