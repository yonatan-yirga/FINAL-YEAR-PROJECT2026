#!/usr/bin/env python
"""
Verify ApplicationSerializer Fix
This script checks if the student_internship_status field is properly configured
"""
import os
import sys

# Check the file directly
print("="*70)
print("CHECKING SERIALIZER FILE")
print("="*70)
print()

file_path = "apps/applications/serializers.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check 1: Field declaration
if "student_internship_status = serializers.SerializerMethodField()" in content:
    print("✅ Field is declared as SerializerMethodField")
else:
    print("❌ Field declaration is MISSING")
    sys.exit(1)

# Check 2: Field in Meta.fields
if "'student_internship_status'," in content:
    print("✅ Field is in Meta.fields list")
else:
    print("❌ Field is NOT in Meta.fields list")
    sys.exit(1)

# Check 3: Getter method exists
if "def get_student_internship_status(self, obj):" in content:
    print("✅ Getter method exists")
else:
    print("❌ Getter method is MISSING")
    sys.exit(1)

print()
print("="*70)
print("FILE CHECK: ALL GOOD ✅")
print("="*70)
print()

# Now check if Django can load it
print("="*70)
print("CHECKING DJANGO MODULE")
print("="*70)
print()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    import django
    django.setup()
    
    from apps.applications.serializers import ApplicationSerializer
    from rest_framework import serializers as drf_serializers
    
    # Check if the field exists in the loaded class
    if hasattr(ApplicationSerializer, 'student_internship_status'):
        field = getattr(ApplicationSerializer, 'student_internship_status')
        if isinstance(field, drf_serializers.SerializerMethodField):
            print("✅ Field is loaded and is a SerializerMethodField")
        else:
            print(f"❌ Field is loaded but wrong type: {type(field)}")
            sys.exit(1)
    else:
        print("❌ Field is NOT loaded in Django")
        print()
        print("⚠️  Django hasn't reloaded the module!")
        print("   Solution: Restart the Django server")
        print()
        sys.exit(1)
    
    # Check if it's in Meta.fields
    if 'student_internship_status' in ApplicationSerializer.Meta.fields:
        print("✅ Field is in Meta.fields")
    else:
        print("❌ Field is NOT in Meta.fields")
        sys.exit(1)
    
    # Check if getter method exists
    if hasattr(ApplicationSerializer, 'get_student_internship_status'):
        print("✅ Getter method is loaded")
    else:
        print("❌ Getter method is NOT loaded")
        sys.exit(1)
    
    print()
    print("="*70)
    print("DJANGO MODULE CHECK: ALL GOOD ✅")
    print("="*70)
    print()
    print("🎉 The serializer is correctly configured!")
    print("   The API should work now.")
    print()
    
except Exception as e:
    print(f"❌ Error loading Django: {e}")
    print()
    print("This might mean Django needs to be restarted.")
    sys.exit(1)
