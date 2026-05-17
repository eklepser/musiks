using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models;

public partial class Artist
{
    public int artist_id { get; set; }

    public string name { get; set; } = null!;

    public string? country { get; set; }

    public int? debut_year { get; set; }

    public string? language { get; set; }

    [NotMapped]
    public virtual ICollection<Concert> concerts { get; set; } = new List<Concert>();

    [NotMapped]
    public virtual ICollection<Merch> merches { get; set; } = new List<Merch>();
}
