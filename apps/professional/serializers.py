from rest_framework import serializers
from .models import Therapist, Booking

class TherapistListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Therapist
        fields = ['id', 'name', 'specializations', 'rating', 'hourly_rate', 'is_available']

class TherapistDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Therapist
        exclude = ['created_at', 'updated_at']

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'therapist', 'booking_date', 'time_slot', 'notes']
        read_only_fields = ['status']

    def validate(self, attrs):
        # Check if the time slot is available
        if Booking.objects.filter(
            therapist=attrs['therapist'],
            booking_date=attrs['booking_date'],
            time_slot=attrs['time_slot'],
            status__in=['pending', 'confirmed']
        ).exists():
            raise serializers.ValidationError(
                {"time_slot": "This time slot is already booked"}
            )
        return attrs