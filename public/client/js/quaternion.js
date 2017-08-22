//Quaternion Functions (https://stackoverflow.com/questions/14167962/how-to-derive-standard-rotations-from-three-js-when-using-quaternions)
// Pass the obj.quaternion that you want to convert here:
//*********************************************************
function quatToEuler (q1) {
    var pitchYawRoll = new THREE.Vector3();
     sqw = q1.w*q1.w;
     sqx = q1.x*q1.x;
     sqy = q1.y*q1.y;
     sqz = q1.z*q1.z;
     unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
     test = q1.x*q1.y + q1.z*q1.w;
    if (test > 0.499*unit) { // singularity at north pole
        heading = 2 * Math.atan2(q1.x,q1.w);
        attitude = Math.PI/2;
        bank = 0;
        return;
    }
    if (test < -0.499*unit) { // singularity at south pole
        heading = -2 * Math.atan2(q1.x,q1.w);
        attitude = -Math.PI/2;
        bank = 0;
        return;
    }
    else {
        heading = Math.atan2(2*q1.y*q1.w-2*q1.x*q1.z , sqx - sqy - sqz + sqw);
        attitude = Math.asin(2*test/unit);
        bank = Math.atan2(2*q1.x*q1.w-2*q1.y*q1.z , -sqx + sqy - sqz + sqw)
    }
    pitchYawRoll.z = Math.floor(attitude * 1000) / 1000;
    pitchYawRoll.y = Math.floor(heading * 1000) / 1000;
    pitchYawRoll.x = Math.floor(bank * 1000) / 1000;

    return pitchYawRoll;
}        

// Then, if I want the specific yaw (rotation around y), I pass the results of
// pitchYawRoll.y into the following to get back the angle in radians which is
// what can be set to the object's rotation.

//*********************************************************
function eulerToAngle(rot) {
    var ca = 0;
    if (rot > 0)
        { ca = (Math.PI*2) - rot; } 
    else 
        { ca = -rot }

    return (ca / ((Math.PI*2)/360));  // camera angle radians converted to degrees
}
