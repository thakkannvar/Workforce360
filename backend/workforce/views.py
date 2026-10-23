
from rest_framework import viewsets
from .models import Employee, Task
from .serializers import EmployeeSerializer, TaskSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by("-id")
    serializer_class = EmployeeSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related("employee").all().order_by("-id")
    serializer_class = TaskSerializer
