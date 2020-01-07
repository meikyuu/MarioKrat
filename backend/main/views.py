from django.http import JsonResponse


def allow_methods(*methods):
    def decorator(view):
        def decorated(request, *args, **kwargs):
            if request.method not in methods:
                return JsonResponse(
                    status=405,
                    data={
                        'code': 'MethodNotAllowed',
                        'message': 'The provided method is not allowed.',
                    },
                )
            return view(request, *args, **kwargs)
        return decorated
    return decorator
