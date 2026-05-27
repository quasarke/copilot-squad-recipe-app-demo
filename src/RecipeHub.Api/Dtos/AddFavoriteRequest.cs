using System.ComponentModel.DataAnnotations;

namespace RecipeHub.Api.Dtos;

public record AddFavoriteRequest(
    [MaxLength(128)] string UserId,
    int RecipeId
);
