
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, TaskViewSet

router = DefaultRouter()
router.register("employees", EmployeeViewSet)
router.register("tasks", TaskViewSet)

urlpatterns = router.urls
