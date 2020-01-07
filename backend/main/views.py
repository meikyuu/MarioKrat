
from django.http import JsonResponse


def not_found_view(request):
    return JsonResponse(
        status=404,
        data={
            'code': 'NotFound',
            'message': 'The requested url could not be found.',
        },
    )
