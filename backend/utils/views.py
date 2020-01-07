from django.http import JsonResponse

from is_valid import is_decodable_json_where


def allow_methods(*methods):
    def decorator(view):
        def decorated(request, *args, **kwargs):
            if request.method not in methods:
                return JsonResponse(
                    status=405,
                    data={
                        'code': 'MethodNotAllowed',
                        'message': 'Method not allowed.',
                    },
                )
            return view(request, *args, **kwargs)
        return decorated
    return decorator


def validate_body(pred):
    pred = is_decodable_json_where(pred)

    def decorator(view):
        def decorated(request, *args, **kwargs):
            valid = pred.explain(request.body)
            if not valid:
                return JsonResponse(
                    status=400,
                    data={
                        'code': 'BadRequest',
                        'message': 'Request body is not valid.',
                        'details': valid.dict(),
                    },
                )
            return view(request, valid.data, *args, **kwargs)
        return decorated
    return decorator
